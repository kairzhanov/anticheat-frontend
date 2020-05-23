export class User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    permissionLevel: number;
    accessToken?: string;
    refreshToken?: string;
    role: string;

    // constructor (data?) {
    //     if (data) {
    //         this.email = data.email;
    //         this.firstName = data.firstName;
    //         this.lastName = data.lastName;
    //         this.accessToken = data.accessToken;
    //         this.refreshToken = data.refreshToken;
    //     }
    // };
}