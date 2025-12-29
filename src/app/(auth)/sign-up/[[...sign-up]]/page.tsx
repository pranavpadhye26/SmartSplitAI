import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        SmartSplit
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Join thousands splitting expenses smarter
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-xl",
                        },
                    }}
                    path="/sign-up"
                    routing="path"
                    signInUrl="/sign-in"
                    afterSignUpUrl="/dashboard"
                />
            </div>
        </div>
    );
}
