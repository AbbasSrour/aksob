import { useMutation } from "@tanstack/react-query";
import { signOutServerFn } from "@/app/auth/hooks/api/auth.functions";
import { mutationKeyFactory } from "@/constants/mutation-key-factory";

export const useSignOut = () => {
	return useMutation({
		mutationKey: mutationKeyFactory.auth.logout(),
		mutationFn: signOutServerFn,
	});
};
