import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import BackButton from "@/components/ui/BackButton";
import { diffLines } from "diff";
import "./diffStyles.css";

interface NodePathMap {
  [key: string]: string;
}

interface Diff {
  value: string;
  removed?: boolean;
  added?: boolean;
}

interface XMLDiff {
  element: string;
  originalValue: string;
  mlSuggestion: string;
}

interface XMLDiffViewerProps {
  originalXml: string;
  updatedXml: string;
  onDiffExtracted?: (diffs: XMLDiff[]) => void;
}

export const XmlDiffViewer: React.FC<XMLDiffViewerProps> = ({
  originalXml,
  updatedXml,
  onDiffExtracted,
}) => {
  // Always use light theme for better readability
  const isDarkMode = false;

  const normalizedOriginal = originalXml.replace(/\r\n/g, "\n").trim();
  const normalizedUpdated = updatedXml.replace(/\r\n/g, "\n").trim();

  const diff = diffLines(normalizedOriginal, normalizedUpdated);

  const getNodePathValueMap = (node: Element, path = "", result: NodePathMap = {}): NodePathMap => {
    if (node.nodeType === 1) {
      const tagName = node.nodeName.split(":").pop();
      const currentPath = path ? `${path}/${tagName}` : tagName || "";

      if (node.children.length === 0) {
        const value = node.textContent?.trim() || "";
        result[currentPath] = value;
      }

      for (let i = 0; i < node.children.length; i++) {
        getNodePathValueMap(node.children[i], currentPath, result);
      }
    }
    return result;
  };

  useEffect(() => {
    if (typeof onDiffExtracted === "function") {
      const parser = new DOMParser();
      const xmlOriginal = parser.parseFromString(originalXml, "application/xml");
      const xmlUpdated = parser.parseFromString(updatedXml, "application/xml");

      const originalMap = getNodePathValueMap(xmlOriginal.documentElement);
      const updatedMap = getNodePathValueMap(xmlUpdated.documentElement);

      const diffs: XMLDiff[] = [];

      Object.keys(originalMap).forEach((key) => {
        if (originalMap[key] !== updatedMap[key]) {
          diffs.push({
            element: key,
            originalValue: originalMap[key],
            mlSuggestion: updatedMap[key] || "",
          });
        }
      });

      onDiffExtracted(diffs);
    }
  }, [originalXml, updatedXml, onDiffExtracted]);

  return (
    <div
      className={`diff-container ${isDarkMode ? "dark-theme" : "light-theme"}`}
      style={{ position: "relative" }}
    >
      <BackButton position="top-right" variant="minimal" showText={false} fallbackPath="#" />

      <div className="diff-column">
        <h3>Original</h3>
        <pre>
          {diff.map((part: Diff, index: number) =>
            part.removed ? (
              <span key={index} className="removed">
                {part.value}
              </span>
            ) : part.added ? (
              <span key={index} className="empty-line" />
            ) : (
              <span key={index}>{part.value}</span>
            )
          )}
        </pre>
      </div>
      <div className="diff-column">
        <h3>Updated</h3>
        <pre>
          {diff.map((part, index) =>
            part.added ? (
              <span key={index} className="added">
                {part.value}
              </span>
            ) : part.removed ? (
              <span key={index} className="empty-line" />
            ) : (
              <span key={index}>{part.value}</span>
            )
          )}
        </pre>
      </div>
    </div>
  );
};