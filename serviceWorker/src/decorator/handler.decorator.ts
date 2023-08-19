export const Fetch = (match: string, ignore: string | null = null): MethodDecorator => {
  return (target, propertyKey) => {
    if (!global.routerList) global.routerList = [];
    global.routerList.push({ propertyKey: propertyKey as string, match: match, ignore: ignore });
  };
};

export const Message = (match: string): MethodDecorator => {
  return (target, propertyKey) => {
    global.addEventListener("message", (e: any) => {
      if (e?.data?.funcName == match) {
        global.appController[propertyKey](e.data);
      }
    });
  };
};