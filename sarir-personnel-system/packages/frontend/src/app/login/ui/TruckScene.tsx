"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import styles from "../login.module.css";

export function TruckScene() {
  return (
    <div className={styles.truckScene}>
      <motion.div
        className={styles.truckImage}
        animate={{ x: [-6, 6, -6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Image src="/images/truck.png" alt="Sarir Logistic truck" width={320} height={180} priority />
      </motion.div>

      <div className={styles.road}>
        <div className={styles.roadInner} />
      </div>

      <p className={styles.tagline}>A NEW TRACK OF SUCCESS</p>
    </div>
  );
}
