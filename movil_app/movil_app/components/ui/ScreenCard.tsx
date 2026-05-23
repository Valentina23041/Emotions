import { AppTheme } from "@/constants/appTheme";
import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

export default function ScreenCard({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppTheme.colors.card,
    borderRadius: AppTheme.radius.xl,
    padding: AppTheme.spacing.lg,
    ...AppTheme.shadow,
  },
});
