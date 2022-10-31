export const Fetch = (match: string, ignore: string = ""): MethodDecorator => {
  return (target, propertyKey) => {
    if (!global.routerList) global.routerList = [];
    global.routerList.push({ propertyKey: propertyKey as string, match: match, ignore: ignore });
  };
};

export const Message = (match: string): MethodDecorator => {
  return (target, propertyKey) => {
    if (!global.messageList) global.messageList = [];
    global.messageList.push({ propertyKey: propertyKey as string, match: match });
  };
};
