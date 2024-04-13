import {Construct} from "constructs";
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Runtime} from 'aws-cdk-lib/aws-lambda';
import {join} from "node:path";
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';


export class Lambas extends Construct {
    public readonly lambdaLookup: Map<string, NodejsFunction>

    constructor(scope: Construct, id: string) {
        super(scope, id);

        const basicLambdaExecution = iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
        const s3Access = iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
        const role = new iam.Role(this, 'defaultLambdaRole', {
            assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
            managedPolicies: [basicLambdaExecution, s3Access],
        });

        this.lambdaLookup = new Map()
        const getMeta = new NodejsFunction(this, "getMeta", {
            entry: join(__dirname, "getMeta/getMeta.ts"),
            handler: "handler",
            functionName: "getMeta",
            runtime: Runtime.NODEJS_20_X,
            role
        })
        this.lambdaLookup.set("getMeta", getMeta)
    }
}