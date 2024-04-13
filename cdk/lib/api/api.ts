import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {ApiGateway} from "./apigateway/apiGateway";
import {Lambas} from "./lambdas/lambdas";

export class Api extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const lambdas = new Lambas(this, "lambdas")

        const { lambdaLookup } = lambdas
        new ApiGateway(this, "api", {lambdaLookup})
        // The code that defines your stack goes here
    }
}
