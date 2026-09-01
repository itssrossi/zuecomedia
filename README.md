# Deploying an Azure Web Application Using CI/CD with Monitoring Capabilities

## Overview

For this project, I wanted to deploy a basic development environment that follows common DevOps practices and supports three separate environments:

- Feature
- Testing
- Production

The reasoning behind having three environments is to separate development and testing activities from the production environment. This allows new features and changes to be thoroughly tested before being deployed to production, helping to reduce bugs, errors, and downtime and ultimately making the application more reliable.

CI/CD was implemented between the different environments using GitHub Actions. The purpose of this was to ensure that commits are automatically built and tested in a clean environment before being reviewed and merged through a Pull Request.

I also made the decision to deploy the Test branch to an Azure Web App to provide developers with an interactive environment where their code can be deployed, executed, and tested. This allows developers to see how their implementation behaves before it is introduced into the production environment.
Monitoring was also implemented for both the Production Web App and the Test environment to monitor application usage, performance, and potential issues.
For the application itself, I used a mock business application that I created using Lovable.dev. This allowed me to speed up the development process and have a functional application that could be deployed to and tested within the Azure environment.

### The Resources That Have Been Deployed

Azure Resources

DefaultResourceGroup-JNB
- DefaultWorkspace-40ecad4e-1d78-4ecf-a2d0-b42aa22b7502-JNB
  - Log Analytics Workspace

ZCM-RG
### Test Environment
- Zuecomedia-test-id-bd7a
  - Managed Identity
- Zuecomedia-test
  - App Service

### Production Environment
- ZueCoMedia-id-afc9
  - Managed Identity
- MSL_2
  - App Service
- ZueCoMedia
  - Application Insights
- keystothegate
  - Key Vault
- ASP-ZCMVRG-86f6
  - App Service Plan
- Application Insights Smart Detection
  - Action Group

### The Azure resources deployed as part of this project include the infrastructure required to host the application, securely manage configuration and secrets, monitor the application, and support the deployment pipeline.

The Structural Diagram

<img width="1472" height="940" alt="image" src="https://github.com/user-attachments/assets/add87fc5-c9b4-498f-8486-ea3dc65d5afa" />

The structural diagram provides an overview of how the different Azure resources, environments, application components, and deployment processes interact with one another.

## My Decision-Making Process When Selecting the Resources

### Resource group (azurerm_resource_group.rg)

Chosen to keep all the Azure resources for this project together in one place.
I used yebo in southafricanorth so the infrastructure stays organised and can easily be managed or removed as a single environment.

### Service plan (azurerm_service_plan.plan)
os_type = "Windows" — chosen because the application is running as a Windows Web App.
sku_name = "F1" — chosen because this is a testing/learning environment and the free tier is enough for the expected workload. The limitations, such as no Always On and limited CPU time, are acceptable here.

### Web app (azurerm_windows_web_app.webapp)
System-assigned identity — chosen so the application can access Azure services such as Key Vault without storing credentials in the code. This also allowed the RBAC setup to work properly.
always_on = false — set this way because the F1 plan doesn't support Always On. This also fixed the deployment error encountered earlier.
Basic authentication enabled — chosen because the GitHub Actions pipeline currently deploys using an Azure publish profile rather than OIDC.
Application Insights settings — included so application monitoring and telemetry are connected automatically when the app is deployed.

### Log Analytics workspace (azurerm_log_analytics_workspace)
sku = "PerGB2018" — chosen because it's the supported SKU for a new workspace and provides enough capacity for this small test environment.
It was also needed because the Application Insights setup uses a workspace-based configuration.

### Application Insights (azurerm_application_insights.appinsights)

application_type = "Node.JS" — chosen to match the application runtime.

Connected to the Log Analytics workspace so application telemetry has a central place to be stored and analysed.
Chosen because it gives useful visibility into requests, errors, exceptions, and application performance without adding unnecessary infrastructure for a small project.

## Why these resources were chosen

The setup is intentionally kept simple for a development/testing environment:

Windows Web App + F1 Service Plan → keeps hosting free and matches the application.
Application Insights + Log Analytics → provides monitoring and troubleshooting.
Managed Identity + RBAC → avoids putting Azure credentials directly into the application.
Overall, the infrastructure gives the project hosting, deployment, security, and monitoring without adding resources or costs that aren't necessary for this environment

## The Problems I Have Encountered

### Using Application Insights with Node.js

One of the challenges I encountered was getting Application Insights working correctly with the Node.js application.
I resolved this by reviewing the Application Insights configuration and ensuring that the application was correctly configured to send its telemetry to the Application Insights resource. I also ensured that the required configuration was provided through the Azure Web App environment rather than hardcoding sensitive configuration into the application.
This allowed Application Insights to successfully collect application telemetry and provided visibility into the application's behaviour and performance.

### Adjusting to Managed Identity to Ensure the Key Vault Can Be Accessed by the Application

Another challenge I encountered was allowing the Azure Web App to securely access secrets stored within Azure Key Vault.
Initially, the application required credentials to authenticate with Key Vault. I changed this approach to use an Azure Managed Identity, allowing the Web App to authenticate to Azure resources without requiring credentials to be stored within the application.
I then assigned the appropriate permissions to the Managed Identity so that it could retrieve the required secrets from Key Vault.
This provided a more secure solution because authentication is handled by Azure rather than storing credentials directly within the application or source code.

## The CI/CD (YAML)

on:
  push:
    branches: [ "test" ]
  workflow_dispatch:
env:
  AZURE_WEBAPP_NAME: yebo-webapp    # application's name
  AZURE_WEBAPP_PACKAGE_PATH: './dist'      # path web app project
  NODE_VERSION: '20.x'                # node version
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: npm install, build, and test
      run: |
        npm install
        npm run build --if-present
        npm run test --if-present

    - name: Upload artifact for deployment job
      uses: actions/upload-artifact@v4
      with:
        name: node-app
        path: ./dist
  deploy:
    permissions:
      contents: none
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Development'
      url: ${{ steps.deploy-to-webapp.outputs.webapp-url }}

    steps:
    - name: Download artifact from build job
      uses: actions/download-artifact@v4
      with:
        name: node-app

    - name: 'Deploy to Azure WebApp'
      id: deploy-to-webapp
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_WEBAPP_NAME }}
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_TEST_TERRA }}
        package: .

The CI/CD pipeline was implemented using GitHub Actions and YAML.
The pipeline automates the process of building, testing, and deploying the application between the different environments.
The intention was to create a repeatable deployment process where code could be automatically validated before being merged and eventually deployed to production.

### What I Would Do Differently and How I Would Adjust It in Future
Although the current implementation successfully separates the different environments, there are several improvements I would make in a future version of the project.

Deployment Slots

In the current implementation, I deployed a separate Azure Web App environment for testing.
In the future, I would consider using Azure App Service Deployment Slots instead of deploying an entirely separate set of resources for the testing environment.

This would allow me to test deployments within a staging environment before swapping the tested version into production.
It would also reduce duplicated infrastructure and could make the overall architecture more cost-effective and easier to manage.

Production Lifecycle Protection

I would also implement stronger lifecycle protection for production resources.

This would help prevent critical production resources from accidentally being destroyed during Terraform operations.
I would also look at implementing additional safeguards within the production deployment pipeline, such as approval requirements before production deployments are allowed to proceed.
Overall, these changes would make the infrastructure more secure, resilient, and production-ready while reducing the risk of accidental changes to critical resources.
