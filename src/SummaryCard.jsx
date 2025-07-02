import React from "react";
function SummaryCard({ heading, value, bgColor, children }) {
  return (
    <div
      className="card shadow-sm border-1 p-2"
      style={{
        maxWidth: "20rem",
        minHeight: "3.5rem",
        backgroundColor: `var(${bgColor})`,
        // backgroundColor: "#ff0000", // Red color
      }}
    >
      <div className="d-flex justify-content-between align-items-center">
        <div>
          {/* <p>{bgColor}</p> */}
          <p className="text-muted mb-1 small">{heading}</p>
          <h5 className="mb-0 fw-bold">{value}</h5>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export default SummaryCard;
