"use client";

import Image from "next/image";

const ThankYou = () => {
  return (
    <div className="p-50 flex items-center justify-center">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Image
            src="/thank-you.png"
            alt="Thank You"
            height={300}
            width={300}
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-neutral-900 -mt-2">
          Thank You!
        </h1>
      </div>
    </div>
  );
};

export default ThankYou;