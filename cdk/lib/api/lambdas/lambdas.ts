import {Construct} from "constructs";
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {join} from "node:path";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

type lambdasProps = {
    deploymentType: string;
}


export class Lambas extends Construct {
    public readonly lambdaLookup: Map<string, NodejsFunction>

    constructor(scope: Construct, id: string, props: lambdasProps) {
        super(scope, id);

        const {deploymentType} = props

        const basicLambdaExecution = iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
        const s3Access = iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
        const role = new iam.Role(this, 'defaultLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [basicLambdaExecution, s3Access],
        });

        this.lambdaLookup = new Map()
        const name = "getMeta"
        const lambdaId = `${deploymentType}-${name}`
        const getMeta = new NodejsFunction(this, lambdaId, {
            entry: join(__dirname, "getMeta/getMeta.ts"),
            handler: "handler",
            functionName: lambdaId,
            runtime: Runtime.NODEJS_20_X,
            role,
            environment: {
                s3Bucket: `${deploymentType}-lor-meta`,
                deploymentType
            },
        })
        this.lambdaLookup.set("getMeta", getMeta)
    }
}