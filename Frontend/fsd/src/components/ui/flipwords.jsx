import React from "react";

function FlipWordsComponent() {
  const words = ["better", "cute", "beautiful", "modern"];

  return (
    <div className="h-[40rem] flex justify-center items-center px-4">
      <div className="text-4xl mx-auto font-normal text-neutral-600 dark:text-neutral-400">
        Build{" "}
        <span className="font-bold text-blue-500">
          {words.map((word, index) => (
            <span key={index} className="mr-2">
              {word}
            </span>
          ))}
        </span>
        <br />
        websites with Aceternity UI
      </div>
    </div>
  );
}

export default FlipWordsComponent;
export { FlipWordsComponent };