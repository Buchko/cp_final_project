import {Construct} from 'constructs'
import {LambdaIntegration, RestApi, Resource} from 'aws-cdk-lib/aws-apigateway'
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {deploymentTypes} from "../../../constants/types"
import {metricDataPointsList} from "aws-sdk/clients/frauddetector";

type LambdaLookup = Map<string, NodejsFunction>

interface Props {
    lambdaLookup: Map<string, NodejsFunction>
    deploymentType: deploymentTypes
}

export class ApiGateway extends Construct {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);
        const {deploymentType} = props

        const {lambdaLookup} = props
        const nameAndId = `${deploymentType}-api`

        const api = new RestApi(this, nameAndId, {
            restApiName: nameAndId,
            deployOptions: {
                stageName: "main"
            }
        })
        const root = api.root.addResource("api")
        const meta = root.addResource("meta")
        addLambdaIntegration(meta, "GET", lambdaLookup, "getMeta")
    }
}

const addLambdaIntegration = (resource: Resource, method: string, lambdaLookup: LambdaLookup, lambdaName: string) => {
    const func = lambdaLookup.get(lambdaName)
    if (!func) {
        throw new Error(`lambda lookup failed for ${method}`)
    }
    resource.addMethod(method, new LambdaIntegration(func))
}