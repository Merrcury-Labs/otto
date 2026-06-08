import { NextResponse } from "next/server";
import {
  executeGraphqlRequest,
  type GraphqlRequestBody,
} from "@/lib/graphql/schema";

export async function POST(request: Request) {
  const body = (await request.json()) as GraphqlRequestBody;
  const { result, status } = await executeGraphqlRequest(body);

  return NextResponse.json(result, {
    status,
  });
}
