import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.android.billingclient.api.*;
import android.widget.Button;
import android.widget.Toast;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private BillingClient billingClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        billingClient = BillingClient.newBuilder(this)
                .setListener(new PurchasesUpdatedListener() {
                    @Override
                    public void onPurchasesUpdated(BillingResult billingResult, List<Purchase> purchases) {
                        if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                            for (Purchase purchase : purchases) {
                                handlePurchase(purchase);
                            }
                        }
                    }
                })
                .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(BillingResult billingResult) {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    // Billing client setup complete
                }
            }

            @Override
            public void onBillingServiceDisconnected() {
                // Handle the disconnection case
            }
        });

        Button unlockProButton = findViewById(R.id.unlockProButton);
        unlockProButton.setOnClickListener(v -> startPurchaseFlow());
    }

    private void startPurchaseFlow() {
        BillingFlowParams billingFlowParams = BillingFlowParams.newBuilder()
                .setSku("pro_version")  // SKU for Pro version
                .setType(BillingClient.SkuType.INAPP)  // Type of product (In-app)
                .build();
        billingClient.launchBillingFlow(this, billingFlowParams);
    }

    private void handlePurchase(Purchase purchase) {
        if (purchase.getPurchaseState() == Purchase.PurchaseState.PURCHASED) {
            unlockProFeatures();
            // Send verification to backend
            verifyPurchaseWithBackend(purchase.getPurchaseToken());
        }
    }

    private void unlockProFeatures() {
        // Logic to unlock Pro features
        Toast.makeText(this, "Pro Features Unlocked!", Toast.LENGTH_SHORT).show();
    }

    private void verifyPurchaseWithBackend(String purchaseToken) {
        // Send purchase token to the backend server for verification (Python Flask)
        // Implement backend API integration (HTTP POST) here
    }
}
