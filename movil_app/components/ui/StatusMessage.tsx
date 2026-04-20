import { AppTheme } from "@/constants/appTheme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  message: string;
  type: "success" | "error";
};

export default function StatusMessage({ message, type }: Props) {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <View style={[styles.box, isSuccess ? styles.successBox : styles.errorBox]}>
      <Text
        style={[styles.text, isSuccess ? styles.successText : styles.errorText]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    padding: 12,
    borderRadius: AppTheme.radius.sm,
    marginBottom: 16,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  successBox: {
    backgroundColor: AppTheme.colors.successBg,
    borderColor: AppTheme.colors.successBorder,
  },
  errorBox: {
    backgroundColor: AppTheme.colors.errorBg,
    borderColor: AppTheme.colors.errorBorder,
  },
  successText: {
    color: AppTheme.colors.successText,
  },
  errorText: {
    color: AppTheme.colors.errorText,
  },
});
