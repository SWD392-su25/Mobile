import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   padding: 20,
  // },
  overlay: {
    backgroundColor: "rgba(216, 211, 211, 0.63)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 14,
  },
  inputContainer: {
    width: "100%",
    position: "relative",
    marginBottom: 15,
  },
  inputPassword: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
  },
  icon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  rememberContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },

  rememberGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 30,
  },

  rememberText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    right: 10,
  },

  forgotPassword: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  agreement: {
    fontSize: 12,
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#000",
  },
  LoginButton: {
    backgroundColor: "#2672ec",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  LoginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
  orText: {
    marginHorizontal: 10,
    color: "#fff",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dd4b39",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    marginBottom: 20,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#fff",
  },
  footerText: {
    color: "#fff",
    fontSize: 14,
  },
  checkbox: {
    marginRight: 10,
  },
  errorText: {
    color: "red",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 10,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default styles;
