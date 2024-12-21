# standbypool

> see https://aka.ms/autorest

This is the AutoRest configuration file for standbypool.

## Getting Started

To build the SDKs for My API, simply install AutoRest via `npm` (`npm install -g autorest`) and then run:

> `autorest readme.md`

To see additional help and options, run:

> `autorest --help`

For other options on installation see [Installing AutoRest](https://aka.ms/autorest/install) on the AutoRest github page.

---

## Configuration

### Basic Information

These are the global settings for the standbypool.

``` yaml
openapi-type: arm
openapi-subtype: rpaas
tag: package-2024-03
```

### Suppression

``` yaml
suppressions:
  - code: OperationIdNounVerb
    where: $.paths["/subscriptions/{subscriptionId}/resourceGroups/{resourceGroupName}/providers/Microsoft.StandbyPool/standbyVirtualMachinePools/{standbyVirtualMachinePoolName}/standbyVirtualMachines"].get.operationId
    reason: OperationId "StandbyVirtualMachines_ListByStandbyVirtualMachinePoolResource" does seem to be a Noun_Verb
```

``` yaml
modelerfour:
  flatten-models: false
```

### Tag: package-2024-03

These settings apply only when `--tag=package-2024-03` is specified on the command line.

```yaml $(tag) == 'package-2024-03'
input-file:
  - Microsoft.StandbyPool/stable/2024-03-01/standbypool.json
```

### Tag: package-preview-2024-03

These settings apply only when `--tag=package-preview-2024-03` is specified on the command line.

```yaml $(tag) == 'package-preview-2024-03'
input-file:
  - Microsoft.StandbyPool/preview/2024-03-01-preview/standbypool.json
```

### Tag: package-preview-2023-12

These settings apply only when `--tag=package-preview-2023-12` is specified on the command line.

```yaml $(tag) == 'package-preview-2023-12'
input-file:
  - Microsoft.StandbyPool/preview/2023-12-01-preview/standbypool.json
```

---

# Code Generation

## Swagger to SDK

This section describes what SDK should be generated by the automatic system.
This is not used by Autorest itself.

``` yaml $(swagger-to-sdk)
swagger-to-sdk:
  - repo: azure-resource-manager-schemas
  - repo: azure-cli-extensions
  - repo: azure-powershell
  - repo: azure-sdk-for-go
```

## CSharp

See configuration in [readme.csharp.md](./readme.csharp.md)

## Go

See configuration in [readme.go.md](./readme.go.md)