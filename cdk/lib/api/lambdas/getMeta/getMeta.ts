import {Context,} from 'aws-lambda';
import {Maybe} from "purify-ts/Maybe"
import {S3} from "aws-sdk"
import "dotenv/config"
const { deploymentType  = "", s3Bucket = "" } = process.env

import {wrapper} from "../middleWare"
import {deprecate} from "node:util";

const s3 = new S3()

const main = async (event: any, context: any) => {
    const {mode} = event
    //fetch from s3
    const keyPrefix = `${deploymentType}/${mode}`
    console.log({event, keyPrefix})
    const nodes = await fetchFromS3(`lor-meta`, `${keyPrefix}/nodes.json`)
    const edges = await fetchFromS3(`lor-meta`, `${keyPrefix}/edges.json`)
    return {nodes, edges}
};


const fetchFromS3 =  async (bucket: string, key: string) => {
    const res = await s3.getObject({Bucket: bucket, Key: key,  }).promise()
    // @ts-ignore
    return Maybe.of(res.Body).map((b) => b.toString("utf-8")).map(JSON.parse).extract()
}
export const handler = wrapper(main)