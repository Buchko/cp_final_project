#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import {Api} from "../lib/api/api";
import "dotenv/config"

const deploymentType = process.env["DEPLOYMENT_TYPE"]
console.log({deploymentType})
console.log(process.env)
if (!deploymentType || !["development", "staging", "production"].includes(deploymentType)) {
    throw new Error("invalid deployment type")
}

const app = new cdk.App();
new Api(app, `${deploymentType}-api`, {
    //@ts-ignore: checked deploymentType earlier
    deploymentType
});

