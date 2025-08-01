// @ts-check
import { CheckStatus, CommitStatusState, PER_PAGE_MAX } from "../../shared/src/github.js";
import { getAdoBuildInfoFromUrl, getAzurePipelineArtifact } from "./artifacts.js";
import { extractInputs } from "./context.js";
import { writeToActionsSummary } from "./github.js";

/**
 * @param {import('@actions/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 * @returns {Promise<void>}
 */
export default async function setSpecGenSdkStatus({ github, context, core }) {
  const inputs = await extractInputs(github, context, core);
  const head_sha = inputs.head_sha;
  const details_url = inputs.details_url;
  const issue_number = inputs.issue_number;
  if (!details_url || !head_sha) {
    throw new Error(
      `Required inputs are not valid: details_url:${details_url}, head_sha:${head_sha}`,
    );
  }
  const owner = inputs.owner;
  const repo = inputs.repo;
  // Default target is this run itself
  let target_url =
    `https://github.com/${context.repo.owner}/${context.repo.repo}` +
    `/actions/runs/${context.runId}`;

  return await setSpecGenSdkStatusImpl({
    owner,
    repo,
    head_sha,
    target_url,
    github,
    core,
    issue_number,
  });
}

/**
 * @param {Object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {string} params.head_sha
 * @param {string} params.target_url
 * @param {number} params.issue_number
 * @param {(import("@octokit/core").Octokit & import("@octokit/plugin-rest-endpoint-methods/dist-types/types.js").Api & { paginate: import("@octokit/plugin-paginate-rest").PaginateInterface; })} params.github
 * @param {typeof import("@actions/core")} params.core
 * @returns {Promise<void>}
 */
export async function setSpecGenSdkStatusImpl({
  owner,
  repo,
  head_sha,
  target_url,
  github,
  core,
  issue_number,
}) {
  const statusName = "SDK Validation Status";
  core.setOutput("issue_number", issue_number);
  const checks = await github.paginate(github.rest.checks.listForRef, {
    owner,
    repo,
    ref: head_sha,
    per_page: PER_PAGE_MAX,
  });

  // Filter sdk generation check runs
  const specGenSdkChecks = checks.filter(
    (check) => check.app?.name === "Azure Pipelines" && check.name.includes("SDK Validation"),
  );

  core.info(`Found ${specGenSdkChecks.length} check runs from Azure Pipelines:`);
  for (const check of specGenSdkChecks) {
    core.info(`- ${check.name}: ${check.status} (${check.conclusion})`);
  }

  // Check if all SDK generation checks have completed
  const allCompleted =
    specGenSdkChecks.length > 0 &&
    specGenSdkChecks.every((check) => check.status === CheckStatus.COMPLETED);
  const allIncompletedChecks = specGenSdkChecks.filter(
    (check) => check.status !== CheckStatus.COMPLETED,
  );
  for (const check of allIncompletedChecks) {
    core.info(`incompleted check runs: ${check.name}: ${check.status} (${check.conclusion})`);
  }

  if (!allCompleted) {
    // At least one check is still running or none found yet, set status to pending
    core.info("Some SDK Validation checks are not completed. Setting status to pending.");

    await github.rest.repos.createCommitStatus({
      owner,
      repo,
      sha: head_sha,
      state: CommitStatusState.PENDING,
      context: statusName,
      description: "Waiting for all SDK Validation checks to complete",
      target_url,
    });
  } else {
    // All checks are completed, check their conclusions
    const result = await processResult({
      checkRuns: specGenSdkChecks,
      core,
    });

    core.info(`All SDK Validation checks completed. Setting status to ${result.state}.`);

    await github.rest.repos.createCommitStatus({
      owner,
      repo,
      sha: head_sha,
      state: result.state,
      context: statusName,
      description: result.description,
      target_url,
    });
  }
}

/**
 * @param {Object} params
 * @param {Array<any>} params.checkRuns
 * @param {typeof import("@actions/core")} params.core
 * @returns {Promise<{state: CommitStatusState, description: string}>}
 */
async function processResult({ checkRuns, core }) {
  /** @type {CommitStatusState} */
  let state = CommitStatusState.SUCCESS;
  let specGenSdkFailedRequiredLanguages = "";
  let description = "SDK Validation CI checks succeeded";

  // Create a summary of the results
  let summaryContent = "## SDK Validation CI Checks Result\n\n";
  summaryContent += "| Language | Status | Required Check |\n";
  summaryContent += "|----------|--------|---------------|\n";

  for (const checkRun of checkRuns) {
    core.info(`Processing check run: ${checkRun.name} (${checkRun.conclusion})`);
    const buildInfo = getAdoBuildInfoFromUrl(checkRun.details_url);
    const ado_project_url = buildInfo.projectUrl;
    const ado_build_id = buildInfo.buildId;
    let artifactName = "spec-gen-sdk-artifact";
    const artifactFileName = `${artifactName}.json`;
    const result = await getAzurePipelineArtifact({
      ado_build_id,
      ado_project_url,
      artifactName,
      artifactFileName,
      core,
      fallbackToFailedArtifact: true,
      token: process.env.ADO_TOKEN,
    });
    // Parse the JSON data
    if (!result.artifactData) {
      throw new Error(
        `Artifact '${artifactName}' not found in the build with details_url:${checkRun.details_url}`,
      );
    }
    const artifactJsonObj = JSON.parse(result.artifactData);
    const language = artifactJsonObj.language;
    const shortLanguageName = language.split("-").pop();
    const executionResult = artifactJsonObj.result;
    const isSpecGenSdkCheckRequired = artifactJsonObj.isSpecGenSdkCheckRequired;
    if (isSpecGenSdkCheckRequired && executionResult === "failed") {
      state = CommitStatusState.FAILURE;
      specGenSdkFailedRequiredLanguages += shortLanguageName + ", ";
    }

    // Add status emoji
    const statusEmoji =
      executionResult === "succeeded"
        ? "✅"
        : executionResult === "failed"
          ? "❌"
          : executionResult === "warning"
            ? "⚠️"
            : executionResult === "pending"
              ? "⏳"
              : "❓";

    summaryContent += `| ${shortLanguageName} | ${statusEmoji} ${executionResult} | ${isSpecGenSdkCheckRequired} |\n`;
  }

  if (state === CommitStatusState.FAILURE) {
    specGenSdkFailedRequiredLanguages = specGenSdkFailedRequiredLanguages.replace(/,\s*$/, "");
    description = `SDK Validation failed for ${specGenSdkFailedRequiredLanguages} languages`;
  }

  // Add overall result
  summaryContent += "\n### Overall Result\n\n";
  summaryContent +=
    state === CommitStatusState.SUCCESS
      ? "✅ All required SDK Validation CI checks passed successfully!"
      : `❌ SDK Validation CI checks failed for: ${specGenSdkFailedRequiredLanguages}`;

  // Add next steps
  if (state === CommitStatusState.FAILURE) {
    summaryContent +=
      "\n### Next Steps\n\n" +
      `Address the issues reported in the the SDK Validation CI checks for language(s): ${specGenSdkFailedRequiredLanguages}.` +
      `\n### More Information\n\n` +
      `Refer to the [SDK Validation Wiki](https://github.com/Azure/azure-rest-api-specs/wiki/SDK-Validation).`;
  }

  // Write to the summary page
  await writeToActionsSummary(summaryContent, core);

  return {
    state,
    description,
  };
}
