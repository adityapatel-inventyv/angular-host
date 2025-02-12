declare module '*.wasm' {
    const value: any;
    export default value;

  export function add_one(arg0: number): any {
    throw new Error('Function not implemented.');
  }
}
