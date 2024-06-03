import {Context, APIGatewayProxyResult, APIGatewayEvent, APIGatewayProxyEvent} from 'aws-lambda';

export const wrapper = (func: (event: any, context: any) => Promise<any>) => {
    return async (event: APIGatewayProxyEvent, context: any): Promise<any> => {
        try {
            console.log(JSON.stringify(event, null, 4))
            console.log(JSON.stringify(context, null, 4))

            const body = getBody(event)
            const combinedBodyAndQuery = {...body, ...event.queryStringParameters}

            console.log({combinedBodyAndQuery})

            const result = await func(combinedBodyAndQuery, context)
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            }
        } catch (error) {
            const jsonString = JSON.stringify(error)
            console.log(jsonString)
            return {
                statusCode: 500,
                body: jsonString
            }
        }
    }
}

const getBody = (event) => {
    if (event.body) {
        return JSON.parse(event.body)
    }
    return event
}