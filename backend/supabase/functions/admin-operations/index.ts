import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleAdminToggleRequest } from "../_shared/adminToggleHandler.ts";

serve(handleAdminToggleRequest);
