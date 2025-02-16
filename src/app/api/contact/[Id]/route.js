import connectToMongoDB from "@/dbConfig/dbConnnect";
import { Contacts } from "@/models/Contacts";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

connectToMongoDB();

// Get Contact Details
export async function GET(request, { params }) {
    try {
      // Fetch headers and log them for debugging
      const headers = Object.fromEntries(request.headers.entries());
      console.log("Headers:", headers);
  
      const authorization = headers.authorization;
  
      // Check if authorization token exists
      if (!authorization) {
        return NextResponse.json(
          { message: "Token is Missing" },
          { status: 400 }
        );
      }
  
      // Extract token without 'Bearer ' prefix
      const token = authorization.startsWith("Bearer ")
        ? authorization.split(" ")[1]
        : authorization;
  
      let payload;
  
      try {
        // Verify JWT token
        payload = jwt.verify(token, process.env.SECRET_KEY);
        console.log("Decoded payload:", payload);
      } catch (error) {
        return NextResponse.json(
          { message: "Token is Invalid or Expired." },
          { status: 401 }
        );
      }
  
      const { Id } = params;
      if (!Id) {
        return NextResponse.json(
          { message: "Contact ID is required" },
          { status: 400 }
        );
      }
  
      // Ensure MongoDB is connected
      if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGO_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      }
  
      // Check if the contact exists
      const existingUser = await Contacts.exists({ _id: Id });
      if (!existingUser) {
        return NextResponse.json(
          { message: "Contact does not exist" },
          { status: 404 }
        );
      }
  
      // Fetch contact details
      const data = await Contacts.findOne({ _id: Id });
      console.log("Contact data:", data);
  
      return NextResponse.json(
        {
          message: "Contact fetched successfully",
          data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error:", error.message);
  
      return NextResponse.json(
        { message: "An error occurred while processing the request." },
        { status: 500 }
      );
    }
  }

// Update Contact Details
export async function PUT(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");
  console.log("authorization", authorization);

  // Check if authorization token exists
  if (!authorization) {
    return NextResponse.json(
      {
        message: "Token is Missing",
      },
      { status: 400 }
    );
  }

  // Extract token without 'Bearer ' prefix
  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;
  let payload;

  try {
    // Verify JWT token
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

  const { Id } = params;
  console.log(Id);

  // Ensure the Id exists in params
  if (!Id) {
    return NextResponse.json(
      {
        message: "Contact ID is required",
      },
      { status: 400 }
    );
  }

  const reqbody = await NextRequest.json();

  const { type, address, others } = reqbody;

  // Validate required fields based on type
  if (!type) {
    return NextResponse.json(
      {
        message: "Type is required.",
      },
      { status: 400 }
    );
  }

  if (type === "address") {
    const {
      addressLine1,
      addressLine2,
      addressType,
      city,
      state,
      postalCode,
      country,
    } = address;

    // Validate required fields for address type
    if (
      !addressLine1 ||
      !addressType ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        {
          message: "Please provide all required fields for address.",
        },
        { status: 400 }
      );
    }

    try {
      // Update address information
      const data = await Contacts.findByIdAndUpdate(
        Id,
        {
          type,
          address: 
            {
              addressLine1,
              addressLine2,
              addressType,
              city,
              state,
              postalCode,
              country,
            },
          others: {}, // Clear 'others' if updating address type
        },
        { new: true }
      );

      if (!data) {
        return NextResponse.json(
          {
            message: "Contact not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Contact details updated successfully.",
          data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating contact address:", error);
      return NextResponse.json(
        {
          message: "Error while updating the data",
        },
        { status: 500 }
      );
    }
  }

  if (type === "others") {
    const { contactType, channelType, value } = others;

    // Validate required fields for 'others' type
    if (!contactType || !channelType || !value) {
      return NextResponse.json(
        {
          message: "Please provide all required fields for others type.",
        },
        { status: 400 }
      );
    }

    try {
      // Update others contact information
      const data = await Contacts.findByIdAndUpdate(
        Id,
        {
          type,
          address: {}, // Clear 'address' if updating 'others' type
          others:
            {
              contactType,
              channelType,
              value
            },
        },
        { new: true }
      );

      if (!data) {
        return NextResponse.json(
          {
            message: "Contact not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Contact details updated successfully.",
          data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating contact others:", error);
      return NextResponse.json(
        {
          message: "Error while updating the data",
        },
        { status: 500 }
      );
    }
  }

  // If the type is not 'address' or 'others', return an error
  return NextResponse.json(
    {
      message: "Invalid type specified.",
    },
    { status: 400 }
  );
}

//Patch Contact
export async function PATCH(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");
  console.log("authorization", authorization);

  // Check if authorization token exists
  if (!authorization) {
    return NextResponse.json(
      {
        message: "Token is Missing",
      },
      { status: 400 }
    );
  }

  // Extract token without 'Bearer ' prefix
  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;
  let payload;

  try {
    // Verify JWT token
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

  const { Id } = params;
  console.log(Id);

  // Ensure the Id exists in params
  if (!Id) {
    return NextResponse.json(
      {
        message: "Contact ID is required",
      },
      { status: 400 }
    );
  }

  const reqbody = await NextRequest.json();

  const { type, address, others } = reqbody;

  // Validate required fields based on type
  if (!type) {
    return NextResponse.json(
      {
        message: "Type is required.",
      },
      { status: 400 }
    );
  }

  if (type === "address") {
    const {
      addressLine1,
      addressLine2,
      addressType,
      city,
      state,
      postalCode,
      country,
    } = address;

    // Validate required fields for address type
    if (
      !addressLine1 ||
      !addressType ||
      !city ||
      !state ||
      !postalCode ||
      !country
    ) {
      return NextResponse.json(
        {
          message: "Please provide all required fields for address.",
        },
        { status: 400 }
      );
    }

    try {
      // Update address information
      const data = await Contacts.findByIdAndUpdate(
        Id,
        {
          type,
          address: 
            {
              addressLine1,
              addressLine2,
              addressType,
              city,
              state,
              postalCode,
              country,
            },
          others: {}, // Clear 'others' if updating address type
        },
        { new: true }
      );

      if (!data) {
        return NextResponse.json(
          {
            message: "Contact not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Contact details updated successfully.",
          data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating contact address:", error);
      return NextResponse.json(
        {
          message: "Error while updating the data",
        },
        { status: 500 }
      );
    }
  }

  if (type === "others") {
    const { contactType, channelType, value } = others;
    console.log(contactType, channelType, value);
    // Validate required fields for 'others' type
    if (!contactType || !channelType || !value) {
      return NextResponse.json(
        {
          message: "Please provide all required fields for others type.",
        },
        { status: 400 }
      );
    }

    try {
      // Update others contact information
      const data = await Contacts.findByIdAndUpdate(
        Id,
        {
          type,
          address: {}, // Clear 'address' if updating 'others' type
          others: 
            {
              contactType,
              channelType,
              value,
            },
        },
        { new: true }
      );

      if (!data) {
        return NextResponse.json(
          {
            message: "Contact not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: "Contact details updated successfully.",
          data,
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error updating contact others:", error);
      return NextResponse.json(
        {
          message: "Error while updating the data",
        },
        { status: 500 }
      );
    }
  }

  // If the type is not 'address' or 'others', return an error
  return NextResponse.json(
    {
      message: "Invalid type specified.",
    },
    { status: 400 }
  );
}

export async function DELETE(NextRequest, { params }) {
  const authorization = await NextRequest.headers.get("authorization");
  console.log("authorization", authorization);

  // Check if authorization token exists
  if (!authorization) {
    return NextResponse.json(
      {
        message: "Token is Missing",
      },
      { status: 400 }
    );
  }

  // Extract token without 'Bearer ' prefix
  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;
  let payload;

  try {
    // Verify JWT token
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

  const { Id } = params;

  const exists = await Contacts.findOne({ _id: Id });

  if (!exists) {
    return NextResponse.json({
      message: "Existing Contact is not exists.",
    });
  }
  let data;

  try {
    data = await Contacts.findByIdAndDelete(Id);
  } catch (error) {
    return NextResponse.json({
      message: "Error While deleting the contact",
    });
  }

  return NextResponse.json(
    {
      message: "Contact is Deleted Successfully...",
      data,
    },
    { status: 200 }
  );
}
