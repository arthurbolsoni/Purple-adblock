const methodDecoratorFactory= () => {
  return (match: string, ignore: string = ""): MethodDecorator => {
    return (target, propertyKey) => {
      if(!global.routerList) global.routerList = []
      global.routerList.push({ propertyKey: propertyKey as string, match: match, ignore: ignore})
    };
  };
};
export const Fetch = methodDecoratorFactory();
export const Message = methodDecoratorFactory();