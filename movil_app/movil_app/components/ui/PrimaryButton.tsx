import { AppTheme } from "@/constants/appTheme";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableOpacityProps,
} from "react-native";

type Props = TouchableOpacityProps & {
  title: string;
};

export default function PrimaryButton({ title, style, ...props }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.85}
      {...props}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: AppTheme.colors.primary,
    borderColor: AppTheme.colors.primaryBorder,
    borderWidth: 1.5,
    borderRadius: AppTheme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 170,
    ...AppTheme.shadow,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
