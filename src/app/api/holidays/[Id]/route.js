import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const { Holidays } = require("@/models/Holidays");
const { NextResponse } = require("next/server");

export async function GET(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({
      message: "Token is Missing",
    });
  }

  const token = authorization;
  let payload;
  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
    console.log(payload);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Token is Invalid or Expired.",
      },
      { status: 401 }
    );
  }

  const { Id } = await params;
  const holidayExists = mongoose.Types.ObjectId.isValid(Id);
  console.log(holidayExists);

  if (!holidayExists) {
    return NextResponse.json(
      {
        message: "Holiday is not exists",
      },
      { status: 400 }
    );
  }

  try {
    const data = await Holidays.findById(Id);

    return NextResponse.json(
      {
        message: "Holiday is listed successfully...",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Error while fetching the data by Id",
      },
      { status: 400 }
    );
  }
}

export async function PUT(NextRequest, { params }) {
  const authorization = NextRequest.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({
      message: "Token is Missing",
    }, { status: 401 });
  }

  const token = authorization;
  let payload;
  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return NextResponse.json({
      message: "Token is Invalid or Expired.",
    }, { status: 401 });
  }

  const { Id } = await params;

  if (!mongoose.Types.ObjectId.isValid(Id)) {
    return NextResponse.json({
      message: "Invalid Holiday ID",
    }, { status: 400 });
  }

  const reqbody = await NextRequest.json();
  const {
    title,
    date: inputDate,
    holidayType,
    alternateWorkingDate,
    year,
  } = reqbody;

  if (!title || !inputDate || !holidayType || !year) {
    return NextResponse.json({
      message: "Please provide all required fields.",
    }, { status: 400 });
  }

  try {
    const date = new Date(inputDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json({
        message: "Invalid date format.",
      }, { status: 400 });
    }
    const formattedDate = date.toISOString();

    // Check if holiday exists
    const holidayExists = await Holidays.findById(Id);
    if (!holidayExists) {
      return NextResponse.json({
        message: "Holiday does not exist.",
      }, { status: 404 });
    }

    const updatedData = await Holidays.findByIdAndUpdate(
      Id,
      {
        title,
        date: formattedDate,
        holidayType,
        year,
        alternateWorkingDate: alternateWorkingDate || null,
      },
      { new: true } // Return the updated document
    );

    console.log("Updated Holiday:", updatedData);

    return NextResponse.json({
      message: "Holiday updated successfully",
      data: updatedData,
    }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({
      message: "Error while updating the holiday.",
    }, { status: 500 });
  }
}


export async function PATCH(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({
      message: "Token is Missing",
    });
  }

  const token = authorization;
  let payload;
  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Token is Invalid or Expired.",
      },
      { status: 401 }
    );
  }

  const { Id } = params;
  const reqbody = await NextRequest.json();
  const {
    title,
    date: inputDate,
    holidayType,
    alternateWorkingDate,
    year,
  } = reqbody;

  if (!title || !inputDate || !holidayType || !year) {
    return NextResponse.json(
      {
        message: "Please enter required fields.",
      },
      { status: 400 }
    );
  }

  const holidaysExists = mongoose.Types.ObjectId.isValid(Id);

  if (!holidaysExists) {
    return NextResponse.json(
      {
        message: "Holiday is not exists",
      },
      { status: 400 }
    );
  }

  try {
    const date = new Date(inputDate);
    const formattedDate = date.toISOString();
    const data = await Holidays.findByIdAndUpdate(
      Id,
      {
        title,
        date: formattedDate,
        holidayType,
        year,
        alternateWorkingDate,
      },
      { new: true }
    );
    return NextResponse.json(
      {
        message: "Holiday is updated successfully",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error while updating the data",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");

  if (!authorization) {
    return NextResponse.json({
      message: "Token is Missing",
    });
  }

  const token = authorization;
  let payload;
  try {
    payload = jwt.verify(token, process.env.SECRET_KEY);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Token is Invalid or Expired.",
      },
      { status: 401 }
    );
  }

  const { Id } = params;

  const HolidayExists = mongoose.Types.ObjectId.isValid(Id);

  if (!HolidayExists) {
    return NextResponse.json(
      {
        message: "Id is not found",
      },
      { status: 404 }
    );
  }

  try {
    const data = await Holidays.findByIdAndDelete(Id);
    return NextResponse.json(
      {
        message: "Holiday is deleted successfully...",
        data,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Error While deleting the holiday",
      },
      { status: 400 }
    );
  }
}
