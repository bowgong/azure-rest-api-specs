## TypeScript

These settings apply only when `--typescript` is specified on the command line.
Please also specify `--typescript-sdks-folder=<path to root folder of your azure-sdk-for-js clone>`.

``` yaml $(typescript)
typescript:
  azure-arm: true
  package-name: "@azure/arm-containerservice"
  output-folder: "$(typescript-sdks-folder)/sdk/containerservice/arm-containerservice"
  generate-metadata: true

directive:
  - from: managedClusters.json
    where: $.definitions.MachineIpAddress
    transform: >
      $.properties.family["x-ms-enum"].name = "IpFamily"
```