// File: src/components/HomeButton.tsx
import React from "react";

interface HomeButtonProps {
  className?: string;
  imgPath: string;
  onClick?: () => void;
  children: React.ReactNode;
}

const HomeButton: React.FC<HomeButtonProps> = ({
  className = "",
  imgPath,
  onClick = () => {},
  children,
}) => {
  return (
    <button
      className={
        "group rounded-2xl flex items-center justify-center select-none cursor-pointer " +
        className
      }
      style={{
        position: "relative",
        overflow: "hidden",
      }}
      onClick={onClick}
    >
      {/* Background image */}
      <div
        className="group-hover:scale-105 transition duration-300"
        style={{
          backgroundImage: `url(${imgPath})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "brightness(0.5)", // Darken the background image
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
      />
      {/* Content */}
      <div className="w-full h-full flex items-center justify-center text-white text-xl font-semibold z-10">
        {children}
      </div>
    </button>
  );
};

export default HomeButton;
