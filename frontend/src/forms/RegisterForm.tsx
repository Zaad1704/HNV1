import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "../../validators/userValidator";

// ... useForm({ resolver: zodResolver(registerSchema) })