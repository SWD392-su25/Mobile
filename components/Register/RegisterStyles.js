import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  // container: {
  //   flex: 1,
  //   alignItems: "center",
  //   justifyContent: "center",
  //   padding: 20,
  // },
  background: {
    flex: 1,
  },
  overlay: {
    flexGrow: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
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
  agreement: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  link: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#00CC00",
  },
  createAccountButton: {
    backgroundColor: "#2672ec",
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  createAccountText: {
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
});

export default styles;