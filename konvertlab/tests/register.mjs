/**
 * Test koşusundan önce `@/` takma adını kaydeder.
 * `node --import ./tests/register.mjs …` ile kullanın.
 */
import { register } from "node:module";

register("./alias-hook.mjs", import.meta.url);
