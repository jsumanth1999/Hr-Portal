"use client";
import ContactTable from "@/components/ContactTable";
import React, { useState } from "react";
import { leaveDetails, leaveForm } from "@/utils/personDetails";
import Modal from "@/components/Modal";
import { useSelector } from "react-redux";

const Page = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const selector = useSelector((state) => state.user);

  // Handle button click to show modal
  const handleApplyButton = () => {
    setIsModalVisible(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  return (
    <div>
      {selector.role === "User" && (
        <div className="flex justify-end">
          <button
            className="bg-blue-800 text-white m-2 px-4 py-2 mr-10 font-bold"
            onClick={handleApplyButton}
          >
            Apply Leave
          </button>
        </div>
      )}

      <Modal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        data={leaveForm}
      />
      <div className="p-4 sm:ml-64">
        <ContactTable data={leaveDetails} />
      </div>
    </div>
  );
};

export default Page;
