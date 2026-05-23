import { useMutation } from "@tanstack/react-query";
import { mutationKeyFactory } from "~/app/constants/mutation-key-factory";
import { authClient } from "~/app/lib/auth";

export interface SignUpInput {
	name: string;
	email: string;
	password: string;
	type?: string;
}

export function useSignUp() {
	return useMutation({
		mutationKey: mutationKeyFactory.auth.signUp(),
		mutationFn: async (input: SignUpInput) => {
			const { data, error } = await authClient.signUp.email(input);
			if (error) throw error;
			return data;
		},
		meta: {
			showToast: true,
			loadingMessage: "Creating account...",
			successMessage: "Account created! Welcome to AKSOB.",
			errorMessages: {
				default: "Unable to create account. Please try again.",
			},
		},
	});
}
