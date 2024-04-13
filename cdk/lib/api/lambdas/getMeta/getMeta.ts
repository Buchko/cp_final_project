import {Context,} from 'aws-lambda';
import {Maybe} from "purify-ts/Maybe"
import {S3} from "aws-sdk"

import {wrapper} from "../middleWare"

const s3 = new S3()

const main = async (event: any, context: any) => {
    const {mode} = event
    //fetch from s3
    const nodes = await fetchFromS3("lor-meta", `${mode}/nodes.json`)
    const edges = await fetchFromS3("lor-meta", `${mode}/edges.json`)
    return {nodes, edges}
};


const fetchFromS3 =  async (bucket: string, key: string) => {
    const res = await s3.getObject({Bucket: bucket, Key: key,  }).promise()
    console.log("polar", res)
    // @ts-ignore
    return Maybe.of(res.Body).map((b) => b.toString("utf-8")).map(JSON.parse).extract()
}
export const handler = wrapper(main)