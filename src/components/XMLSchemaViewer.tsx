import React, { useEffect, useState } from "react";
import { Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { useTheme } from "next-themes";

interface XMLSchemaViewerProps {
  xml: string;
}

export const XMLSchemaViewer: React.FC<XMLSchemaViewerProps> = ({ xml }) => {
  const { theme } = useTheme();
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const isDarkMode = theme === "dark";

  const parseXmlToTreeData = (xmlString: string): DataNode[] => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");

    const traverse = (node: Element): DataNode | null => {
      if (node.nodeType !== 1) return null;

      const tagName = node.nodeName.split(":").pop() || "";
      const children = Array.from(node.children)
        .map(traverse)
        .filter((n): n is DataNode => n !== null);

      const title = children.length === 0 
        ? `${tagName}: ${node.textContent?.trim()}` 
        : tagName;

      return {
        title,
        key: Math.random().toString(36).substr(2, 9),
        children: children.length > 0 ? children : undefined,
      };
    };

    const rootNode = traverse(xmlDoc.documentElement);
    return rootNode ? [rootNode] : [];
  };

  useEffect(() => {
    if (xml) {
      const tree = parseXmlToTreeData(xml);
      setTreeData(tree);
    }
  }, [xml]);

  return (
    <div
      style={{
        padding: "1rem",
        background: isDarkMode ? "rgba(255, 255, 255, 0.05)" : "#f5f5f5",
        borderRadius: "6px",
        border: `1px solid ${isDarkMode ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0"}`,
      }}
    >
      <Tree
        treeData={treeData}
        defaultExpandAll
        style={{
          background: "transparent",
          color: isDarkMode ? "#ffffff" : undefined,
        }}
      />
    </div>
  );
};