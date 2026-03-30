export const getMethodColor = (method: string) => {
  switch (method) {
    case "GET":
      return "text-green-600";
    case "POST":
      return "text-yellow-600";
    case "PUT":
      return "text-blue-600";
    case "DELETE":
      return "text-red-600";
    default:
      return "text-gray-400";
  }
};
