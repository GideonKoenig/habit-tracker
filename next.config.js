import { env } from "./src/env.js";
import { withPlausibleProxy } from "next-plausible";

/** @type {import("next").NextConfig} */
const config = {
    experimental: {
        reactCompiler: true,
    },
};

export default withPlausibleProxy({
    customDomain: env.NEXT_PUBLIC_PLAUSIBLE_HOST,
})(config);
