import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../../backend/validators/userValidator";

// ... useForm({ resolver: zodResolver(registerSchema) })
