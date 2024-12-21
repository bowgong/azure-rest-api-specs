# Azure Device Registry

> see https://aka.ms/autorest

## Getting Started

To build the SDKs for Azure Device Registry, simply install AutoRest via `npm` (`npm install -g autorest`) and then run:

> `autorest readme.md`

To see additional help and options, run:

> `autorest --help`

For other options on installation see [Installing AutoRest](https://aka.ms/autorest/install) on the AutoRest github page.

---

## Configuration

### Basic Information

These are the global settings for the Azure Device Registry.

``` yaml
openapi-type: arm
openapi-subtype: rpaas
tag: package-2024-11
```

``` yaml
modelerfour:
  flatten-models: false
```

### Tag: package-2024-11

These settings apply only when `--tag=package-2024-11` is specified on the command line.

```yaml $(tag) == 'package-2024-11'
input-file:
  - Microsoft.DeviceRegistry/stable/2024-11-01/deviceregistry.json
```

### Tag: package-preview-2024-09

These settings apply only when `--tag=package-preview-2024-09` is specified on the command line.

```yaml $(tag) == 'package-preview-2024-09'
input-file:
  - Microsoft.DeviceRegistry/preview/2024-09-01-preview/deviceregistry.json
```

### Tag: package-preview-2023-11

These settings apply only when `--tag=package-preview-2023-11` is specified on the command line.

```yaml $(tag) == 'package-preview-2023-11'
input-file:
  - Microsoft.DeviceRegistry/preview/2023-11-01-preview/deviceregistry.json
```

# Code Generation

## Swagger to SDK

This section describes what SDK should be generated by the automatic system.
This is not used by Autorest itself.

``` yaml $(swagger-to-sdk)
swagger-to-sdk:
  - repo: azure-sdk-for-go
  - repo: azure-sdk-for-java
```

## Go

See configuration in [readme.go.md](./readme.go.md)