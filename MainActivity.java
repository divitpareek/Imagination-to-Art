import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.android.billingclient.api.*;
import android.widget.Button;
import android.widget.Toast;
import java.util.List;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private BillingClient billingClient;
    private final String BACKEND_URL = "http://<YOUR_BACKEND_URL>/verify_purchase"; // Replace with your backend URL
    private final String PRO_VERSION_SKU = "pro_version"; // SKU for the Pro version
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Initialize the Billing Client
        billingClient = BillingClient.newBuilder(this)
                .setListener(new PurchasesUpdatedListener() {
                    @Override
                    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
                            for (Purchase purchase : purchases) {
                                handlePurchase(purchase);
                            }
                        } else if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
                            Toast.makeText(MainActivity.this, "Purchase canceled", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(MainActivity.this, "Error: " + billingResult.getDebugMessage(), Toast.LENGTH_SHORT).show();
                        }
                    }
                })
                .enablePendingPurchases()
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    // Billing client is ready
                    Toast.makeText(MainActivity.this, "Billing service connected", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Handle connection failure
                Toast.makeText(MainActivity.this, "Billing service disconnected", Toast.LENGTH_SHORT).show();
            }
        });

        // Set up the "Unlock Pro" button
        Button unlockProButton = findViewById(R.id.unlockProButton);
        unlockProButton.setOnClickListener(v -> startPurchaseFlow());
    }

    // Start the purchase flow
    private void startPurchaseFlow() {
        List<QueryProductDetailsParams.Product> productList =
                List.of(QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(PRO_VERSION_SKU)
                        .setProductType(BillingClient.ProductType.INAPP)
                        .build());

        billingClient.queryProductDetailsAsync(
                QueryProductDetailsParams.newBuilder().setProductList(productList).build(),
                (billingResult, productDetailsList) -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK
                            && !productDetailsList.isEmpty()) {
                        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                                .setProductDetailsParamsList(List.of(
                                        BillingFlowParams.ProductDetailsParams.newBuilder()
                                                .setProductDetails(productDetailsList.get(0))
                                                .build()
                                ))
                                .build();
                        billingClient.launchBillingFlow(this, billingFlowParams);
                    } else {
                        Toast.makeText(this, "Failed to query product details", Toast.LENGTH_SHORT).show();
                    }
                }
        );
    }

    // Handle the purchase result
    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            // Unlock Pro features locally
            unlockProFeatures();

            // Verify the purchase with the backend
            verifyPurchaseWithBackend(purchase.getPurchaseToken());

            // Acknowledge the purchase
            if (!purchase.isAcknowledged()) {
                AcknowledgePurchaseParams params =
                        AcknowledgePurchaseParams.newBuilder()
                                .setPurchaseToken(purchase.getPurchaseToken())
                                .build();
                billingClient.acknowledgePurchase(params, billingResult -> {
                    if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                        Toast.makeText(this, "Purchase acknowledged", Toast.LENGTH_SHORT).show();
                    }
                });
            }
        }
    }

    // Unlock Pro features locally
    private void unlockProFeatures() {
        Toast.makeText(this, "Pro Features Unlocked!", Toast.LENGTH_SHORT).show();
        // Add logic to enable Pro features here
    }

    // Send the purchase token to the backend for verification
    private void verifyPurchaseWithBackend(String purchaseToken) {
        OkHttpClient client = new OkHttpClient();

        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        String jsonBody = "{\"purchase_token\":\"" + purchaseToken + "\"}";

        RequestBody body = RequestBody.create(jsonBody, JSON);
        Request request = new Request.Builder()
                .url(BACKEND_URL)
                .post(body)
                .build();

        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                runOnUiThread(() -> 
                    Toast.makeText(MainActivity.this, "Backend verification failed: " + e.getMessage(), Toast.LENGTH_SHORT).show()
                );
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    runOnUiThread(() -> 
                        Toast.makeText(MainActivity.this, "Purchase verified successfully!", Toast.LENGTH_SHORT).show()
                    );
                } else {
                    runOnUiThread(() -> 
                        Toast.makeText(MainActivity.this, "Purchase verification failed!", Toast.LENGTH_SHORT).show()
                    );
                }
            }
        });
    }
}
