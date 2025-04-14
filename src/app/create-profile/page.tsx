"use client";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ApiResponse {
  message: string;
}

const createProfile = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/create-profile", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = await response.json();
    return data as ApiResponse;
  } catch (error: any) {
    console.log("Something Went Wrong", error);
    throw new Error(error.message);
  }
};

const Profile = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const { mutate, isPending } = useMutation<ApiResponse, Error>({
    mutationFn: createProfile,
    onSuccess: () => {
      toast.success("Profile Created Successully");
      toast.success("Redirecting To Subscribe.....");
      router.push("/subscribe");
    },
    onError: (error) => {
      console.log(error);
    },
  });

  useEffect(() => {
    if (isLoaded && isSignedIn && !isPending) {
      mutate();
    }
  }, [isLoaded, isSignedIn]);

  return <div></div>;
};

export default Profile;
