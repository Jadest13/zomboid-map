import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../database";

export async function GET(req: NextRequest) {
	const client = await connectDB;
    const db = client.db("map")
    
    let result = await db.collection('info').find().toArray();

    return NextResponse.json(result);
}