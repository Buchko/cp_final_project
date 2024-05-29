import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import {ApiGateway} from "./apigateway/apiGateway";
import {Lambas} from "./lambdas/lambdas";
import {deploymentTypes} from "../../constants/types"

type extendedStackProps = cdk.StackProps & {deploymentType: deploymentTypes}

export class Api extends cdk.Stack {
    constructor(scope: Construct, id: string, props: extendedStackProps) {
        super(scope, id, props);
        const {deploymentType} = props

        const lambdas = new Lambas(this, "lambdas", {deploymentType})

        const { lambdaLookup } = lambdas
        new ApiGateway(this, "api", {lambdaLookup, deploymentType})
        // The code that defines your stack goes here
    }
}
