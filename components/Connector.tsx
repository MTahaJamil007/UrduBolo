import React from "react";
import { View, useWindowDimensions } from "react-native";
import Svg, { Line } from "react-native-svg";
import { colors } from "../constants/colors";

interface ConnectorProps {
  fromOffset: number; // Horizontal offset of previous node (-45, 0, 45)
  toOffset: number;   // Horizontal offset of next node (-45, 0, 45)
  state: "locked" | "unlocked" | "boss";
}

export default function Connector({
  fromOffset,
  toOffset,
  state,
}: ConnectorProps) {
  const { width } = useWindowDimensions();
  const height = 75; // Total vertical distance between nodes
  const centerX = width / 2;

  // Style configurations
  let strokeColor = colors.lockedBorder;
  let strokeWidth = 2.5;
  let strokeDasharray: string | undefined = "5,6";

  if (state === "boss") {
    strokeColor = colors.accent;
    strokeWidth = 4;
    strokeDasharray = undefined;
  } else if (state === "unlocked") {
    strokeColor = colors.primaryLight;
    strokeWidth = 3;
    strokeDasharray = undefined;
  }

  return (
    <View
      style={{
        height,
        width: "100%",
        marginVertical: -15, // Overlap nodes so line ends are perfectly hidden behind circles
        zIndex: -10, // Ensure connectors render underneath LevelNodes
      }}
    >
      <Svg height={height} width={width}>
        <Line
          x1={centerX + fromOffset}
          y1={0}
          x2={centerX + toOffset}
          y2={height}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
        />
      </Svg>
    </View>
  );
}
