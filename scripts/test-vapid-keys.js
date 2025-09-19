const webpush = require("web-push");

console.log("🔧 Testando chaves VAPID...\n");

const publicKey =
  "BHcePVYo65T2D8M2tfU6gJ45LoLiVh9Dq1_qZxShxttSuMOz13LnC4ve4OH13ZKj9xT92vdQEMn6yoNsXE14q-E";
const privateKey = "3aO0IxA6-4-uvqInscNxdwXqP3-S1avBpw7T2Bgm_Hk";
const subject = "mailto:admin@shiftmanage.com";

try {
  // Testa se as chaves são válidas
  webpush.setVapidDetails(subject, publicKey, privateKey);

  console.log("✅ VAPID Keys são VÁLIDAS!");
  console.log("📏 Tamanho da chave pública:", publicKey.length, "caracteres");
  console.log("📏 Tamanho da chave privada:", privateKey.length, "caracteres");
  console.log("📧 Subject:", subject);
  console.log("\n🚀 Pronto para usar em produção na Vercel!");
} catch (error) {
  console.log("❌ ERRO: VAPID Keys são INVÁLIDAS!");
  console.log("📝 Erro:", error.message);
  console.log(
    "\n🔄 Execute: node scripts/generate-vapid-keys.js para gerar novas chaves"
  );
}
