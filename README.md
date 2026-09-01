#Deploying a azure web application using CI/CD with monitoring capabilities - Project 1

##Overview

For this project I wanted to deploy a basic development environment that has the capabilities for having for the following environments:

- Feature
- Testing
- Production 

My reasoning for having 3 environments is to separate deployments from the production environment to ensure that new features can be thoroughly tested before being deployed to the production environment which in turn can reduced bugs, errors and downtime for the application making it more reliable.

The use of CI/CD was implemented between each environment using GitHub Actions.
The reasoning for doing this is to ensure that commits are automatically tested in a clean environment before being merged via a pull request.

I have also made the decision to deploy the test-branch to the azure web app to provide an interactive environment for developers when their code can be deployed and ran and interacted with to see how the implementation will affect the production environment.

Monitoring has also been implemented for the production web app and for the test-mode application to monitor usage.

In this project I have used a mock business that I have created using Lovable.dev to speed up the development process to have workable code to put into the azure environment.

##The resources that has been deployed :

###The structural diagram: 


##My decisions making process when selecting the resources :

#The problems I have encountered:

##Using application insights with Node.js:

##Adjust to managed identity to ensure the key vault can be accessed by the application :


##The CI/Cd (yaml):

##What I would do differently and how I would adjust it in future : 
In future I would implement deployment slots rather then deploy an entire set of resources for the testing environment


I would also deploy lifecycles rules for the production pipeline with not to be deleted rule
