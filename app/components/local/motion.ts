import { motion } from "framer-motion";
import type { ComponentType } from "react";

/*
 * framer-motion 10 com os tipos do React 19 não aceita className/children em
 * motion.*. Os componentes funcionam; só a tipagem quebra. Estes apelidos
 * mantêm o build passando até atualizar o framer-motion.
 */
export const MDiv = motion.div as unknown as ComponentType<any>;
export const MSpan = motion.span as unknown as ComponentType<any>;
export const MLi = motion.li as unknown as ComponentType<any>;
