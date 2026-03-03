import React from "react";

const IsDevelopment = () => {
    return typeof process !== "undefined" && process.env?.NODE_ENV === "development";
};

export default IsDevelopment;
