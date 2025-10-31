import React from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";
import { LeftOutlined } from "@ant-design/icons";

interface BackButtonProps {
  fallbackPath: string;
  position?: "top-left" | "top-right";
  variant?: "default" | "floating" | "minimal";
  showText?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
  fallbackPath,
  position = "top-left",
  variant = "default",
  showText = true,
}) => {
  const router = useRouter();

  const handleBack = () => {
    router.push(fallbackPath);
  };

  const getPositionStyles = () => {
    const base = {
      position: "absolute",
      margin: "1rem",
      zIndex: 10,
    } as const;

    return {
      "top-left": { ...base, left: 0, top: 0 },
      "top-right": { ...base, right: 0, top: 0 },
    }[position];
  };

  const getVariantStyles = () => {
    return {
      default: {
        backgroundColor: "transparent",
        border: "none",
      },
      floating: {
        backgroundColor: "white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
      },
      minimal: {
        backgroundColor: "transparent",
        border: "none",
        padding: 0,
      },
    }[variant];
  };

  return (
    <Button
      onClick={handleBack}
      style={{
        ...getPositionStyles(),
        ...getVariantStyles(),
      }}
      icon={<LeftOutlined />}
    >
      {showText && "Back"}
    </Button>
  );
};

export default BackButton;