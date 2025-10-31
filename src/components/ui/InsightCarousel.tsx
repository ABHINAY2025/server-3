import React, { useState, useEffect, ReactNode } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/theme-provider";

interface InsightCarouselProps {
  items: ReactNode[];             // Accepts React nodes for slides
  autoPlayDelay?: number;         // Delay in ms
  showIndicators?: boolean;
  showNavigation?: boolean;
}

const InsightCarousel: React.FC<InsightCarouselProps> = ({
  items,
  autoPlayDelay = 5000,
  showIndicators = true,
  showNavigation = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const { isDarkMode } = useTheme();

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length, autoPlayDelay]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  const handleIndicatorClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    setTimeout(() => setIsAutoPlaying(true), 2000);
  };

  if (!items || items.length === 0) return null;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "110px",
        overflow: "hidden",
        borderRadius: 3,
        border: isDarkMode
          ? "1px solid rgba(255, 255, 255, 0.1)"
          : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: isDarkMode
          ? "0 4px 12px rgba(0, 0, 0, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        "&:hover": {
          boxShadow: isDarkMode
            ? "0 6px 20px rgba(0, 0, 0, 0.25)"
            : "0 6px 20px rgba(0, 0, 0, 0.12)",
        },
      }}
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Main Carousel Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -50, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ width: "100%", height: "100%" }}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      {showNavigation && items.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
              color: isDarkMode ? "white" : "#1a1a1a",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
              zIndex: 2,
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)",
                transform: "translateY(-50%) scale(1.05)",
              },
              width: 32,
              height: 32,
              transition: "all 0.2s ease",
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.8)",
              color: isDarkMode ? "white" : "#1a1a1a",
              border: isDarkMode ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(0,0,0,0.2)",
              zIndex: 2,
              "&:hover": {
                backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.95)",
                transform: "translateY(-50%) scale(1.05)",
              },
              width: 32,
              height: 32,
              transition: "all 0.2s ease",
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </>
      )}

      {/* Indicators */}
      {showIndicators && items.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 1,
            zIndex: 2,
          }}
        >
          {items.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleIndicatorClick(index)}
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  currentIndex === index
                    ? isDarkMode
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(0,0,0,0.8)"
                    : isDarkMode
                    ? "rgba(255,255,255,0.3)"
                    : "rgba(0,0,0,0.3)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: isDarkMode ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
                  transform: "scale(1.2)",
                },
              }}
            />
          ))}
        </Box>
      )}

      {/* Progress bar */}
      {isAutoPlaying && items.length > 1 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 2,
            backgroundColor: "rgba(66,165,245,0.8)",
            zIndex: 2,
            animation: `progressBar ${autoPlayDelay}ms linear infinite`,
            "@keyframes progressBar": {
              "0%": { width: "0%" },
              "100%": { width: "100%" },
            },
          }}
        />
      )}
    </Box>
  );
};

export default InsightCarousel;
